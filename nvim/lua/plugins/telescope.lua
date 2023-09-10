local status_ok, telescope = pcall(require, "telescope")

if not status_ok then
    print("telescope didn't load check yours " .. vim.fn.stdpath("config") .. "/lua/plugins/telescope.lua")
    return
end


local actions = require('telescope.actions')


telescope.setup {
    defaults = {
        mappings = {
            i = {
                ["<esc>"] = actions.close,
                ["<C-h>"] = "which_key",
                ["<S-Tab>"] = actions.toggle_selection + actions.move_selection_worse,
                ["<Tab>"] = actions.toggle_selection + actions.move_selection_better,
            },
            -- My config
            n = {
                ["<S-Tab>"] = actions.toggle_selection + actions.move_selection_worse,
                ["<Tab>"] = actions.toggle_selection + actions.move_selection_better,
            }
        }
    },
    extensions = {
        -- telescope.setup {
            -- extensions = {
                fzf = {
                    fuzzy = true,                    -- false will only do exact matching
                    override_generic_sorter = true,  -- override the generic sorter
                    override_file_sorter = true,     -- override the file sorter
                    case_mode = "smart_case",        -- or "ignore_case" or "respect_case"
                }
            -- }
        -- },
        -- file_browser = {
                --   theme = "ivy",
                --   -- disables netrw and use telescope-file-browser in its place
                --   hijack_netrw = true,
                --   mappings = {
                    --     ["i"] = {
                        --       -- your custom insert mode mappings
                        --     },
                        --     ["n"] = {
                            --       -- your custom normal mode mappings
                            --     },
                            --   },
                            -- },
    }
}
telescope.load_extension('fzf')
-- require("telescope").load_extension("file_browser")





-- local nv_tree_dir = require("nvim-tree.api").tree.get_nodes().absolute_path



