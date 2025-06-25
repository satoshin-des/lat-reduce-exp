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
    }

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
    }

    /**
     * 
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
     * GSO情報の計算
     */
    computeGso() {
        for (let i = 0; i < this.nrows; i++) {
            this.mu[i][i] = 1;

            for (let j = 0; j < this.ncols; j++) {
                this.gsoMat[i][j] = this.basis[i][j];
            }

            for (let j = 0; j < i; j++) {
                mu[i][j] = this.dotProduct(basis[i], this.gsoMat[j]) / this.dotProduct(this.gsoMat[j], this.gsoMat[j]);
                for (let k = 0; k < this.ncols; k++) {
                    this.gsoMat[i][k] -= mu[i][j] * this.gsoMat[j][k];
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
    sizeReduce(i, j) {
        if (this.mu[i][j] > 0.5 || this.mu[i][j] < -0.5) {
            let q = Math.round(this.mu[i][j]);

            for (let k = 0; k < this.ncols; k++) {
                if (k <= j) {
                    this.mu[i][k] -= q * this.mu[j][k];
                }
                this.basis[i][k] -= q * this.basis[j][k];
            }
        }
    }
}

function clicked() {
    const input = document.getElementById("input");
    //const output = document.getElementById("output");

    let dim = input.value;
    let lat = new Lattice(dim, dim);
    lat.print();
    console.log(output.innerHTML);
}
