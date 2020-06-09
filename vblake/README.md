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
const hash = Module.vblake('0123');
```
