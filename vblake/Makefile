CC=emcc
CXX=em++
OPTIONS=\
	-s NO_EXIT_RUNTIME=1 \
	-s WASM=1 \
	-s MODULARIZE=1 \
	-s DISABLE_EXCEPTION_CATCHING=1 \
	-s ALLOW_MEMORY_GROWTH=0 \
	--closure 1 \
    -s SINGLE_FILE=1
EXPORTED=-s EXPORTED_FUNCTIONS="['vblake']"
CXXFLAGS=-Os -fno-exceptions
CFLAGS=-Os -fno-rtti

OBJ=bindings.bc vblake.bc

%.bc: %.cpp
	$(CXX) -c -std=c++11 -o $@ $< $(CXXFLAGS) $(OPTIONS)

%.bc: %.c
	$(CC) -c -o $@ $< $(CFLAGS) $(OPTIONS) $(EXPORTED)

OUT=vblake_module.js
$(OUT): $(OBJ)
	$(CXX) --bind -o $@ $^ $(OPTIONS) $(CXXFLAGS)

.PRECIOUS: $(OUT)

all: $(OUT)

.PHONY: clean
clean:
	rm -f $(OBJ)
	rm -f vblake_module*
