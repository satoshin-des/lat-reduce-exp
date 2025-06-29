const output = document.getElementById("output");

output.innerHTML = ``

/**
 * 指定時間待機する
 * @param {Number} ms 待機時間
 * @returns 
 */
function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 格子のクラス
 */
class Lattice {
    /**
     * 
     * @param {Number} nrows 格子階数
     * @param {Number} ncols 格子ベクトルのサイズ
     */
    constructor(nrows, ncols) {
        this.nrows = nrows;
        this.ncols = ncols;

        this.basis = new Array(nrows);
        this.mu = new Array(nrows);
        this.gsoMat = new Array(nrows);
        this.B = new Array(nrows);
        for (let i = 0; i < nrows; i++) {
            this.gsoMat[i] = new Array(ncols);
            this.basis[i] = new Array(ncols);
            this.mu[i] = new Array(nrows);

            this.B[i] = 0;
            for (let j = 0; j < ncols; j++) {
                this.basis[i][j] = 0;
                this.gsoMat[i][j] = 0;
            }
            for (let j = 0; j < nrows; j++) {
                this.mu[i][j] = 0;
            }

            this.basis[i][i] = 1;
            this.basis[i][0] = Math.round(Math.random() * 89999) + 10000
        }

        this.firstBasisNorm = this.norm(this.basis[0]);
        this.shorterNorm = this.norm(this.basis[0]);
    }

    /**
     * 格子基底行列の出力
     */
    print() {
        let str = `<p style="color: white;">`;
        for (let i = 0; i < this.nrows; i++) {
            for (let j = 0; j < this.ncols; j++) {
                str += `${this.basis[i][j]} `;
            }
            str += `<br>`;
        }
        str += `</p>`;
        output.innerHTML += str;
        str = `<hr>`
        output.innerHTML += str;
    }

    /**
     * 二つのベクトルの内積を計算する関数
     * @param {Array} x ベクトル
     * @param {Array} y ベクトル
     * @returns 内積
     */
    dotProduct(x, y) {
        let sum = 0.0;
        for (let i = 0; i < x.length; i++) {
            sum += x[i] * y[i];
        }
        return sum;
    }

    /**
     * ベクトルのノルムを計算する関数
     * @param {Array} x ベクトル
     * @returns ノルム
     */
    norm(x) {
        let sum = 0.0;
        for (let i = 0; i < x.length; i++) {
            sum += x[i] * x[i];
        }
        return Math.sqrt(sum);
    }

    coeffToLatticeVector(coeffVector) {
        let latticeVector = new Array(this.ncols);
        let sum;
        let i, j;
        for (j = 0; j < this.ncols; ++j) {
            sum = 0;
            for (i = 0; i < this.nrows; ++i) {
                sum += coeffVector[i] * this.basis[i][j];
            }
            latticeVector[j] = sum;
        }
        return latticeVector;
    }

    /**
     * GSO情報の計算
     */
    computeGSO() {
        let i, j, k;
        for (i = 0; i < this.nrows; ++i) {
            this.mu[i][i] = 1;

            for (j = 0; j < this.ncols; ++j) {
                this.gsoMat[i][j] = this.basis[i][j];
            }

            for (j = 0; j < i; ++j) {
                this.mu[i][j] = this.dotProduct(this.basis[i], this.gsoMat[j]) / this.dotProduct(this.gsoMat[j], this.gsoMat[j]);
                for (k = 0; k < this.ncols; ++k) {
                    this.gsoMat[i][k] -= this.mu[i][j] * this.gsoMat[j][k];
                }
            }
            this.B[i] = this.dotProduct(this.gsoMat[i], this.gsoMat[i]);
        }
    }

    /**
     * 部分サイズ基底簡約アルゴリズム
     * @param {Number} i インデックス
     * @param {Number} j インデックス
     */
    partialSizeReduce(i, j) {
        if (this.mu[i][j] > 0.5 || this.mu[i][j] < -0.5) {
            const q = Math.round(this.mu[i][j]);

            for (let k = 0; k < this.ncols; ++k) {
                if (k <= j) {
                    this.mu[i][k] -= q * this.mu[j][k];
                }
                this.basis[i][k] -= q * this.basis[j][k];
            }
        }
    }

    /**
     * サイズ基底簡約アルゴリズム
     * @param {Boolean} printInformation 基底更新に関する情報を出力するかどうか
     */
    sizeReduce(printInformation) {
        let str = ``;
        this.computeGSO();

        for (let i = 1; i < this.nrows; ++i) {
            if (printInformation) {
                this.firstBasisNorm = this.norm(this.basis[0]);
                if (this.firstBasisNorm < this.shorterNorm) {
                    this.shorterNorm = this.firstBasisNorm;
                    str = `<p style="color: white;">A shorter vector is found: ${this.firstBasisNorm}<br>`
                    for (let j = 0; j < this.ncols; j++) {
                        str += `${this.basis[0][j]}`
                    }
                    str += `</p><br>`
                    output.innerHTML += str
                }
            }

            for (let j = i - 1; j >= 0; j--) {
                this.partialSizeReduce(i, j);
            }
        }
        output.innerHTML += `<hr>`
    }

    /**
     * 
     * @param {Number} delta 簡約パラメタ
     * @param {Boolean} printInformation 基底更新に関する情報を出力するか
     */
    async LLL(delta, printInformation) {
        this.computeGSO();

        let str
        let tmp;

        for (let k = 1; k < this.nrows;) {
            if (printInformation) {
                this.firstBasisNorm = this.norm(this.basis[0]);
                if (this.firstBasisNorm < this.shorterNorm) {
                    this.shorterNorm = this.firstBasisNorm;
                    str = `<p style="color: white;">A shorter vector is found: ${this.firstBasisNorm}<br>`;
                    for (let j = 0; j < this.ncols; j++) {
                        str += `${this.basis[0][j]} `;
                    }
                    str += `</p><br>`;
                    output.innerHTML += str;

                    await wait(16);
                }
            }

            for (let j = k - 1; j >= 0; --j) {
                this.partialSizeReduce(k, j);
            }

            if ((k > 0) && (this.B[k] < (delta - this.mu[k][k - 1] * this.mu[k][k - 1]) * this.B[k - 1])) {
                for (let i = 0; i < this.ncols; ++i) {
                    tmp = this.basis[k - 1][i];
                    this.basis[k - 1][i] = this.basis[k][i];
                    this.basis[k][i] = tmp;
                }

                this.computeGSO();
                k = Math.max(1, k - 1);
            } else {
                ++k;
            }

        }
    }

    /**
     * DeepLLL簡約アルゴリズム
     * @param {Number} delta 簡約パラメタ
     * @param {Boolean} printInformation 基底更新に関する情報を出力するか
     */
    async deepLLL(delta, printInformation) {
        this.computeGSO();

        let str;
        let tmp, C;
        let count = 0;

        for (let k = 1; k < this.nrows;) {
            if (printInformation) {
                this.firstBasisNorm = this.norm(this.basis[0]);
                if (this.firstBasisNorm < this.shorterNorm) {
                    this.shorterNorm = this.firstBasisNorm;
                    str = `<p style="color: white;">A shorter vector is found: ${this.firstBasisNorm}<br>`;
                    for (let j = 0; j < this.ncols; j++) {
                        str += `${this.basis[0][j]} `;
                    }
                    str += `</p><br>`;
                    output.innerHTML += str;

                    await wait(16);
                }
            }

            for (let j = k - 1; j >= 0; --j) {
                this.partialSizeReduce(k, j);
            }

            C = this.dotProduct(this.basis[k], this.basis[k]);

            for (let i = 0; i < k;) {
                ++count;

                if (count >= 10) {
                    count = 0;
                    await wait(16);
                }

                if (C >= delta * this.B[i]) {
                    C -= this.mu[k][i] * this.mu[k][i] * this.B[i];
                    ++i;
                } else {
                    for (let h = 0; h < this.ncols; ++h) {
                        tmp = this.basis[k][h];
                        for (let j = k; j > i; --j) {
                            this.basis[j][h] = this.basis[j - 1][h];
                        }
                        this.basis[i][h] = tmp;
                    }
                    this.computeGSO();
                    k = Math.max(i - 1, 0);
                }
            }
            ++k;
        }
    }

    /**
     * 最短ベクトルの数え上げアルゴリズム
     */
    async ENUM() {
        let temp, count = 0, str;
        let latticeVector;
        let hasSolution = false;
        let r = new Array(this.nrows + 1).fill().map((_, i) => i);
        let lastNonzero = 0;
        let wt = new Array(this.nrows).fill(0);
        let tempVector = new Array(this.nrows).fill(0);
        let coeffVector;
        let center = new Array(this.nrows).fill(0);
        let sigma = new Array(this.nrows + 1).fill().map(() => Array(this.nrows).fill(0));
        let rho = new Array(this.nrows + 1).fill(0);
        let R = this.B[0];

        tempVector[0] = 1;

        this.computeGSO();

        for (let k = 0; ;) {
            ++count;
            if (count >= 10) {
                count = 0;
                await wait(16);
            }

            temp = tempVector[k] - center[k];
            temp *= temp;
            rho[k] = rho[k + 1] + temp * this.B[k];
            if (rho[k] <= R) {
                if (k == 0) {
                    R = Math.min(0.99 * rho[0], R);
                    hasSolution = true;
                    coeffVector = Array.from(tempVector);

                    latticeVector = this.coeffToLatticeVector(coeffVector);
                    str = `<p style="color: white;">A shorter vector is found: ${this.norm(latticeVector)}<br>`;
                    for (let j = 0; j < this.ncols; j++) {
                        str += `${latticeVector[j]} `;
                    }
                    str += `</p><br>`;
                    output.innerHTML += str;

                    await wait(16);
                } else {
                    --k;
                    if (r[k + 1] >= r[k]) {
                        r[k] = r[k + 1];
                    }
                    for (let i = r[k]; i > k; --i) {
                        sigma[i][k] = sigma[i + 1][k] + mu[i][k] * tempVector[i];
                    }
                    center[k] = -sigma[k + 1][k];
                    tempVector[k] = Math.round(center[k]);
                    wt[k] = 1;
                }
            } else {
                ++k;
                if (k == this.nrows) {
                    if (!hasSolution) {
                        coeffVector = new Array(this.nrows).fill(0);
                    }
                    break;
                } else {
                    r[k] = k;
                    if (k >= lastNonzero) {
                        lastNonzero = k;
                        ++tempVector[k];
                    } else {
                        if (tempVector[k] > center[k]) {
                            tempVector[k] -= wt[k];
                        } else {
                            tempVector[k] += wt[k];
                        }
                        ++wt[k];
                    }
                }
            }
        }
    }

    /*
    #include "stdafx.h"

#include "test.h"

bool QRLatRed::ENUM(VectorXli &coeff_vector, double R, const long start, const long end)
{
    bool has_solution = false;
    const long n = end - start;
    long i, j, r[n + 1];
    long last_nonzero = 0;
    long double temp;
    long weight[n];
    VectorXli temp_vector = VectorXli::Zero(n);
    long double center[n];
    long double sigma[n + 1][n];
    m_rho = VectorXld::Zero(n + 1);

    temp_vector.coeffRef(0) = 1;
    for (i = 0; i < n; ++i)
    {
        weight[i] = 0;
        center[i] = 0;
        for (j = 0; j <= n; ++j)
        {
            sigma[j][i] = 0;
        }
        r[i] = i;
    }

    for (long k = 0;;)
    {
        temp = static_cast<long double>(temp_vector.coeff(k)) - center[k];
        temp *= temp;
        m_rho.coeffRef(k) = m_rho.coeff(k + 1) + temp * m_B.coeff(k + start);
        if (m_rho.coeff(k) <= R)
        {
            if (k == 0)
            {
                R = std::min(static_cast<double>(0.99 * m_rho.coeff(0)), R);
                has_solution = true;
                coeff_vector = temp_vector;
            }
            else
            {
                --k;
                if (r[k + 1] >= r[k])
                {
                    r[k] = r[k + 1];
                }
                for (i = r[k]; i > k; --i)
                {
                    sigma[i][k] = sigma[i + 1][k] + m_mu.coeff(i + start, k + start) * temp_vector.coeff(i);
                }
                center[k] = -sigma[k + 1][k];
                temp_vector.coeffRef(k) = round(center[k]);
                weight[k] = 1;
            }
        }
        else
        {
            ++k;
            if (k == n)
            {
                if (not has_solution)
                {
                    coeff_vector.setZero();
                }
                return has_solution;
            }
            else
            {
                r[k] = k;
                if (k >= last_nonzero)
                {
                    last_nonzero = k;
                    ++temp_vector.coeffRef(k);
                }
                else
                {
                    if (temp_vector.coeff(k) > center[k])
                    {
                        temp_vector.coeffRef(k) -= weight[k];
                    }
                    else
                    {
                        temp_vector.coeffRef(k) += weight[k];
                    }

                    ++weight[k];
                }
            }
        }
    }
}

    */
}

/**
 * 格子
 */
let lat;// = new Lattice(5, 5);

function clicked() {
    const input = document.getElementById("input");
    //const output = document.getElementById("output");

    let dim = parseInt(input.value);
    lat = new Lattice(dim, dim);
    lat.computeGSO();
}

function clickedPrintBasis() {
    lat.print();
    console.log(output.innerHTML);
}

function clickedSizeReduce() {
    lat.sizeReduce(true);
}

function clickedLLL() {
    lat.LLL(0.99, true);
}

function clickedDeepLLL() {
    lat.deepLLL(0.99, true);
}

function clickedENUM(){
    lat.ENUM();
}

function clearInner() {
    output.innerHTML = ``
}
