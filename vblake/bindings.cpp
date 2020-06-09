#include <string>
#include <iomanip>
#include <sstream>
#include <emscripten/bind.h>

extern "C" {
#include "vblake.h"
}

using namespace emscripten;

std::vector<char> HexToBytes(const std::string& hex) {
  std::vector<char> bytes;

  for (unsigned int i = 0; i < hex.length(); i += 2) {
    std::string byteString = hex.substr(i, 2);
    char byte = (char) strtol(byteString.c_str(), NULL, 16);
    bytes.push_back(byte);
  }

  return bytes;
}

template <typename T>
std::string HexStr(const T itbegin, const T itend) {
  std::string rv;
  // clang-format off
  static const char hexmap[16] = {'0','1','2','3','4','5','6','7','8','9','a','b','c','d','e','f'};
  // clang-format on
  rv.reserve(std::distance(itbegin, itend) * 2u);
  for (T it = itbegin; it < itend; ++it) {
    auto val = (uint8_t)(*it);
    rv.push_back(hexmap[val >> 4u]);
    rv.push_back(hexmap[val & 15u]);
  }
  return rv;
}

template <typename T>
inline std::string HexStr(const T& vch) {
  return HexStr(vch.begin(), vch.end());
}

std::string vblake_glue(std::string in) {
    std::string out(VBLAKE_HASH_SIZE, 0);
    auto n = HexToBytes(in);
    if(0 != vblake((void*)out.data(), (const void*)n.data(), n.size())){
        return "";
    }
    return HexStr(out.begin(), out.end());
}

EMSCRIPTEN_BINDINGS(vblake) {
  function("vblake", &vblake_glue);
}
