vim.g.loaded_netrw = 1
vim.g.loaded_netrwPlugin = 1


local status_ok, nv_tree = pcall(require, "nvim-tree")

if not status_ok then
    print("nvim-tree didn't load check yours " .. vim.fn.stdpath("config") .. "/lua/plugins/nvim-tree.lua")
    return
end


-- OR setup with some options
nv_tree.setup({
    sort_by = "case_sensitive",
    view = {
        width = 30,

        centralize_selection = true,
        cursorline = true,
        preserve_window_proportions = true,
    },
    renderer = {
        group_empty = true,
    },
    filters = {
        dotfiles = false,
    },
    git = {
        enable = true,
        timeout = 200 -- in ms, if git takes more than timeout time to load - abondon git, helps with performance in big projects
        -- run 'git status --porcelain=v1 --ignored=matching -u' to check how much time it takes, for additional information
        -- https://github.com/nvim-tree/nvim-tree.lua/issues/549
    },

    hijack_cursor = true,

    on_attach = my_on_attach,
})


-- local status_ok, api = pcall(require, "nvim-tree.api")
-- 
-- if not status_ok then
--     print("nvim-tree.api didn't load check yours " .. vim.fn.stdpath("config") .. "/lua/plugins/nvim-tree.lua")
--     return
-- end


local api = PROTECTED(require, "nvim-tree.api")

local current_file = vim.fn.bufname()

if vim.fn.getftype(current_file) ~= "dir" then
    api.tree.toggle()
end
