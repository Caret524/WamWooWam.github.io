﻿const WASM_initInput = (() => {
    let WASM_canvas = document.getElementById("canvas");

    let WASM_mouseDownHandler = null;
    let WASM_mouseUpHandler = null;
    let WASM_mouseMoveHandler = null;
    let WASM_keyDownHandler = null;
    let WASM_keyUpHandler = null;

    WASM_canvas.addEventListener("mousedown", (ev) => {
        if (WASM_mouseDownHandler === null) {
            WASM_mouseDownHandler = Module.mono_bind_static_method(
                "[Sonic4Episode1.Wasm]Microsoft.Xna.Framework.Input.WasmMouse:InjectMouseDown");
        }

        let size = WASM_canvas.getBoundingClientRect();
        WASM_mouseDownHandler(((ev.clientX - size.left) / size.width) * 800, ((ev.clientY - size.top) / size.height) * 480, ev.button);
    })

    WASM_canvas.addEventListener("mouseup", (ev) => {
        if (WASM_mouseUpHandler === null) {
            WASM_mouseUpHandler = Module.mono_bind_static_method(
                "[Sonic4Episode1.Wasm]Microsoft.Xna.Framework.Input.WasmMouse:InjectMouseUp");
        }

        let size = WASM_canvas.getBoundingClientRect();
        WASM_mouseUpHandler(((ev.clientX - size.left) / size.width) * 800, ((ev.clientY - size.top) / size.height) * 480, ev.button);
    })

    WASM_canvas.addEventListener("mousemove", (ev) => {
        if (WASM_mouseMoveHandler === null) {
            WASM_mouseMoveHandler = Module.mono_bind_static_method(
                "[Sonic4Episode1.Wasm]Microsoft.Xna.Framework.Input.WasmMouse:InjectMouseMove");
        }

        let size = WASM_canvas.getBoundingClientRect();
        WASM_mouseMoveHandler(((ev.clientX - size.left) / size.width) * 800, ((ev.clientY - size.top) / size.height) * 480);
    })

    document.addEventListener("keydown", (ev) => {
        if (WASM_keyDownHandler === null) {
            WASM_keyDownHandler = Module.mono_bind_static_method(
                "[Sonic4Episode1.Wasm]Microsoft.Xna.Framework.Input.WasmKeyboard:InjectKeyDown");
        }

        WASM_keyDownHandler(ev.keyCode);

    });

    document.addEventListener("keyup", (ev) => {
        if (WASM_keyUpHandler === null) {
            WASM_keyUpHandler = Module.mono_bind_static_method(
                "[Sonic4Episode1.Wasm]Microsoft.Xna.Framework.Input.WasmKeyboard:InjectKeyUp");
        }

        WASM_keyUpHandler(ev.keyCode);
    });

    class WasmMediaPlayer {        
        constructor() {
            this.volume = 1;
            this.context = new AudioContext();
            this.gainNode = this.context.createGain();
            this.gainNode.connect(this.context.destination);
            
            this.isGarbage = document.createElement("audio").canPlayType("audio/ogg") === "";
        }
        
        setVolume(vol) {
            this.volume = vol;
            this.gainNode.gain.value = vol;
        }
        
        getVolume() {
            return this.volume;
        }

        play(path, loopPos) {
            this.getAudioBuffer(path)
                .then(audioBuffer => {
                    this.playQueue(audioBuffer, loopPos);
                })
        }
        
        stop() {
            if (this.source) {
                this.source.stop();
                this.source = null;
            }
        }

        playQueue(buffer, loopPos) {
            if(this.source) {
                this.source.stop();
            }
            
            this.source = this.context.createBufferSource();
            this.source.buffer = buffer;
            this.source.connect(this.gainNode);

            if (loopPos !== undefined) {
                this.source.loopStart = loopPos;
                this.source.loopEnd = buffer.duration;
                this.source.loop = true;
            }
            
            this.source.start();
        }

        getAudioBuffer(path) {
            var p = "/sonic4" + path;
            if (this.isGarbage) {
                p = p.substring(0, p.length - 4) + ".m4a";
            }
            
            return window.fetch(p)
                .then(response => response.arrayBuffer())
                .then(arrayBuffer => this.context.decodeAudioData(arrayBuffer));
        }
    }

    window.WASM_MediaPlayer = new WasmMediaPlayer();
});