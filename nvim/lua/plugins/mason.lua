local status_ok, mason = pcall(require, "mason")

if not status_ok then
    print("mason didn't load check yours " .. vim.fn.stdpath("config") .. "/lua/plugins/mason.lua")
    return
end




local status_ok, mason_lsp_config = pcall(require, "mason-lspconfig")

if not status_ok then
    print("mason-lspconfig didn't load check yours " .. vim.fn.stdpath("config") .. "/lua/plugins/mason.lua")
    return
end


mason.setup()
mason_lsp_config.setup()
