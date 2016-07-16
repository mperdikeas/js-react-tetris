'use strict';

import {Howl}        from 'howler';

function notAllowed() {
    (new Howl({
        urls: ['not-allowed.mp3'],
        sprite: {
            all: [0, 100]
        }
    })).play('all');
}

function done() {
    (new Howl({
        urls: ['done.mp3'],
        sprite: {
            all: [0, 100]
        }
    })).play('all');
}

function drop(dropHeight) {

    function heightToVolume(dropHeight) {
        if (dropHeight > 13)
            return 4;
        if (dropHeight > 10)
            return 3.5;
        if (dropHeight > 8)
            return 2.5;
        return 2;
    }
    
    const volume = heightToVolume(dropHeight);
    (new Howl({
        urls: ['drop.mp3'],
        sprite: {
            all: [0, 200]
        },
        volume: volume
    })).play('all');
}

function annihilate(n) {
    (new Howl({
        urls: ['annihilate.mp3'],
        sprite: {
            all: [0, 100+(n-1)*70+(n*n*6)]
        },
        volume: 1+(n*n)/4
    })).play('all');
}

function cashRegister(n) {
    const duration = 300;
    function playSoundOuter (times){
        if (times>0)
            playSound();
        window.setTimeout(()=>{playSoundOuter(times-1);}, duration);
    }
    function playSound (){
        (new Howl({
            urls: ['cash-register.mp3'],
            sprite: {
                all: [100, 500]
            },
            volume: 0.3+n/4
        })).play('all');
    }
    playSoundOuter(n);
}

function swoosh() {
    (new Howl({
        urls: ['swoosh.mp3'],
        sprite: {
            all: [0, 150]
        },
        volume: 1
    })).play('all');
}

function swooshAndThud(dropN) {
    if (dropN>=4) {
        this.swoosh();
        window.setTimeout( ()=> {
            drop(dropN);
        }, 300);
    } else
        drop(dropN);
}

const rv = {
    notAllowed: notAllowed,
    done: done,
    swoosh: swoosh,
    drop: drop,
    swooshAndThud: swooshAndThud,
    annihilate: annihilate,
    cashRegister: cashRegister
}

exports.sound = rv;
