local lspconfig = PROTECTED(require, "lspconfig")

-- Fix Undefined global 'vim'
lspconfig.clangd.setup({
    -- -- cmd = { "clangd", "--compile-commands-dir=/home/anton/tmp/build" },
})
