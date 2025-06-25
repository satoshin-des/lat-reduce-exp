const output = document.getElementById("output");

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
        output.innerHTML = str;
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

    /**
     * GSO情報の計算
     */
    computeGSO() {
        for (let i = 0; i < this.nrows; ++i) {
            this.mu[i][i] = 1;

            for (let j = 0; j < this.ncols; ++j) {
                this.gsoMat[i][j] = this.basis[i][j];
            }

            for (let j = 0; j < i; ++j) {
                this.mu[i][j] = this.dotProduct(this.basis[i], this.gsoMat[j]) / this.dotProduct(this.gsoMat[j], this.gsoMat[j]);
                for (let k = 0; k < this.ncols; ++k) {
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
    LLL(delta, printInformation) {
        this.computeGSO();

        let str
        let tmp, nu, BB, t;

        for (let k = 1; k < this.nrows;) {
            console.log(k);
            console.log(this.mu);
            if (printInformation) {
                this.firstBasisNorm = this.norm(this.basis[0]);
                if (this.firstBasisNorm < this.shorterNorm) {
                    this.shorterNorm = this.firstBasisNorm;
                    str = `<p style="color: white;">A shorter vector is found: ${this.firstBasisNorm}<br>`
                    for (let j = 0; j < this.ncols; j++) {
                        str += `${this.basis[0][j]} `
                    }
                    str += `</p><br>`
                    output.innerHTML += str
                }
            }

            for (let j = k - 1; j >= 0; --j) {
                this.partialSizeReduce(k, j);

                if ((k > 0) && (this.B[k] < (delta - this.mu[k][k - 1] * this.mu[k][k - 1]) * this.B[k - 1])) {
                    for (let i = 0; i < this.ncols; ++i) {
                        tmp = this.basis[k - 1][i];
                        this.basis[k - 1][i] = this.basis[k][i];
                        this.basis[k][i] = tmp;
                    }

                    this.computeGSO();
                    /*
                    nu = this.mu[k][k - 1];
                    BB = this.B[k] + nu * nu * this.B[k - 1];
                    this.mu[k][k - 1] = nu * this.B[k - 1] / BB;
                    this.B[k] *= this.B[k - 1] / BB;
                    this.B[k - 1] = BB;

                    for (let i = 0; i < k - 1; ++i) {
                        t = this.mu[k - 1][i];
                        this.mu[k - 1][i] = this.mu[k][i];
                        this.mu[k][i] = t;
                    }
                    for (let i = k + 1; i < this.nrows; ++i) {
                        t = this.mu[i][k];
                        this.mu[i][k] = this.mu[i][k - 1] - nu * t;
                        this.mu[i][k - 1] = t + this.mu[k][k - 1] * this.mu[i][k];
                    }
                        */
                    k = Math.max(1, k - 1);
                } else {
                    ++k;
                }
            }
        }
    }
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