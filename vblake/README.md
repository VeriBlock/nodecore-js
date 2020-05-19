# WASM bindings on top of C/C++ vblake implementation from alt-integration-cpp

To include in HTML, use this link:
```
https://unpkg.com/@veriblock/vblake@1.0.0/vblake_module.js
```

### Build:

1. Install emsdk - https://emscripten.org/docs/getting_started/downloads.html
2. Run `source emsdk_env.sh` (on Linux/Mac) or `emsdk_env.bat` on Windows.
3. In same terminal as (2) navigate to `vblake` directory.
4. `make`

Result is `vblake_module.js`. Include it in your HTML, and use:
```
const hash = Module.vblake('123');
```

You must pass `bytes` as javascript string! 
Returned argument is also bytes.

Use these to get bytes-from-hex and hex-from-bytes:
```javascript
// Convert a hex string to a byte array
function hexToBytes(hex) {
    for (var bytes = [], c = 0; c < hex.length; c += 2)
    bytes.push(parseInt(hex.substr(c, 2), 16));
    return bytes;
}

// Convert a byte array to a hex string
function bytesToHex(bytes) {
    for (var hex = [], i = 0; i < bytes.length; i++) {
        var current = bytes[i] < 0 ? bytes[i] + 256 : bytes[i];
        hex.push((current >>> 4).toString(16));
        hex.push((current & 0xF).toString(16));
    }
    return hex.join("");
}
```
