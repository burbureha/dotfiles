local lspconfig = PROTECTED(require, "lspconfig")

-- Fix Undefined global 'vim'
lspconfig.lua_ls.setup({
    settings = {
        Lua = {
            diagnostics = {
                globals = { 'vim' }
            }
        }
    }
})
