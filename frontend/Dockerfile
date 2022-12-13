FROM scratch
COPY ./ /

# CMD ["wasmedge" , "--dir", ".:.", "wasmedge_quickjs.wasm", "./server-build/index.js" ]
ENTRYPOINT [ "wasmedge_quickjs.wasm", "./server-build/index.js" ]