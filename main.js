let jsonData;

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
        this.B = new Array(nrows).fill(0);
        for (let i = 0; i < nrows; i++) {
            this.gsoMat[i] = new Array(ncols).fill(0);
            this.basis[i] = new Array(ncols).fill(0);
            this.mu[i] = new Array(nrows).fill(0);
        }
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

    sizeReduce(i, j) {
        if (this.mu[i][j] > 0.5 || this.mu[i][j] < -0.5) {
            let q = Math.round(this.mu[i][j]);
        }
    }
}

function clicked() {
    const input = document.getElementById("input");
    const output = document.getElementById("output");

    //output.innerHTML = searchPlaceNameElements(input.value);
    output.innerHTML = "Hello, World"
}


//
console.log("Hello, World")