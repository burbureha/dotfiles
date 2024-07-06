local status_ok, null_ls = pcall(require, "null-ls")

if not status_ok then
    print("lualine didn't load check yours " .. vim.fn.stdpath("config") .. "/lua/plugins/lualine.lua")
    return
end


null_ls.setup({
    sources = {
        null_ls.builtins.formatting.stylua,
        null_ls.builtins.completion.spell,
    },
})
