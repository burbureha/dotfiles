local status_ok, gitsigns = pcall(require, "gitsigns")

if not status_ok then
    print("gitsigns didn't load check yours " .. vim.fn.stdpath("config") .. "/lua/plugins/gitsigns.lua")
    return
end


gitsigns.setup()
