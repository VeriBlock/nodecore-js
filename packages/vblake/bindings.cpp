#include <string>
#include <emscripten/bind.h>

extern "C" {
#include "vblake.h"
}

using namespace emscripten;

std::string vblake_glue(std::string in) {
    std::string out(VBLAKE_HASH_SIZE, 0);
    vblake((void*)out.data(), (const void*)in.data(), in.size());
    return out;
}

EMSCRIPTEN_BINDINGS(vblake) {
  function("vblake", &vblake_glue);
}
