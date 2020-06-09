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

std::string hexStr(std::string in)
{
     std::stringstream ss;
     ss << std::hex;

     for( int i = 0; i < in.size(); ++i )
         ss << std::setw(2) << std::setfill('0') << (int)in[i];

     return ss.str();
}

std::string vblake_glue(std::string in) {
    std::string out(VBLAKE_HASH_SIZE, 0);
    auto n = HexToBytes(in);
    if(0 != vblake((void*)out.data(), (const void*)n.data(), n.size())){
        return "";
    }
    return hexStr(out);
}

EMSCRIPTEN_BINDINGS(vblake) {
  function("vblake", &vblake_glue);
}
