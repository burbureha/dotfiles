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
        -- adaptive_size = true,
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
    actions = {
        open_file = {
            resize_window = false,
        },
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

--nv_tree.setup({
--        experimental = {},
--        auto_reload_on_write = false,
--        disable_netrw = false,
--        hijack_cursor = false,
--        hijack_netrw = true,
--        hijack_unnamed_buffer_when_opening = false,
--            sort = {
--            sorter = "name",
--            folders_first = true,
--            files_first = false,
--        },
--
--        root_dirs = {},
--        prefer_startup_root = false,
--        sync_root_with_cwd = true,
--        reload_on_bufenter = false,
--        respect_buf_cwd = false,
--        on_attach = "default",
--        select_prompts = false,
--
--        view = {
--            adaptive_size = false,
--            centralize_selection = true,
--            width = 30,
--            cursorline = true,
--            debounce_delay = 15,
--            side = "left",
--            preserve_window_proportions = false,
--            number = false,
--            relativenumber = false,
--            signcolumn = "yes",
--            float = {
--                enable = false,
--                quit_on_focus_loss = true,
--                open_win_config = {
--                relative = "editor",
--                border = "rounded",
--                width = 30,
--                height = 30,
--                row = 1,
--                col = 1,
--                },
--            },
--        },
--
--        renderer = {
--            add_trailing = false,
--            group_empty = false,
--            highlight_git = "name",
--            highlight_opened_files = "none",
--            root_folder_label = ":t",
--            full_name = false,
--            indent_width = 2,
--            special_files = { "Cargo.toml", "Makefile", "README.md", "readme.md" },
--            symlink_destination = true,
--            highlight_diagnostics = "none",
--            highlight_modified = "none",
--            highlight_bookmarks = "none",
--            highlight_clipboard = "name",
--            indent_markers = {
--                enable = false,
--                inline_arrows = true,
--                icons = {
--                    corner = "└",
--                    edge = "│",
--                    item = "│",
--                    bottom = "─",
--                    none = " ",
--                },
--            },
--            icons = {
--                git_placement = "before",
--                padding = " ",
--                symlink_arrow = " ➛ ",
--                modified_placement = "after",
--                diagnostics_placement = "signcolumn",
--                bookmarks_placement = "signcolumn",
--            },
--        },
--    })

--    hijack_directories = {
--        enable = false,
--        auto_open = true,
--    },
--
--    update_focused_file = {
--        enable = true,
--        update_root = {
--            enable = true,
--            ignore_list = {},
--        },
--        exclude = false,
--    },
--
--    diagnostics = {
--        show_on_dirs = false,
--        show_on_open_dirs = true,
--        debounce_delay = 50,
--        severity = {
--            min = vim.diagnostic.severity.HINT,
--            max = vim.diagnostic.severity.ERROR,
--        },
--    },
--
--    filters = {
--        enable = true,
--        dotfiles = false,
--        git_clean = false,
--        git_ignored = false,
--        no_bookmark = false,
--        no_buffer = false,
--        custom = { "node_modules", "\\.cache" },
--        exclude = {},
--    },
--
--    filesystem_watchers = {
--        enable = true,
--        debounce_delay = 50,
--        ignore_dirs = {},
--    },
--
--    git = {
--        enable = true,
--        show_on_dirs = true,
--        show_on_open_dirs = true,
--        disable_for_dirs = {},
--        timeout = 400,
--        cygwin_support = false,
--    },
--
--    actions = {
--        use_system_clipboard = true,
--        change_dir = {
--            enable = true,
--            global = false,
--            restrict_above_cwd = false,
--        },
--        expand_all = {
--            max_folder_discovery = 300,
--            exclude = {},
--        },
--        file_popup = {
--            open_win_config = {
--                col = 1,
--                row = 1,
--                relative = "cursor",
--                border = "shadow",
--                style = "minimal",
--            },
--        },
--        open_file = {
--            quit_on_open = false,
--            eject = true,
--            resize_window = false,
--            window_picker = {
--                enable = true,
--                picker = "default",
--                chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890",
--                exclude = {
--                    filetype = { "notify", "lazy", "qf", "diff", "fugitive", "fugitiveblame" },
--                    buftype = { "nofile", "terminal", "help" },
--                },
--            },
--        },
--        remove_file = {
--            close_window = true,
--        },
--      },
--
--    trash = {
--        cmd = "gio trash",
--    },
--
--    live_filter = {
--        prefix = "[FILTER]: ",
--        always_show_folders = true,
--    },
--
--    tab = {
--        sync = {
--            open = false,
--            close = false,
--            ignore = {},
--        },
--    },
--
--    notify = {
--        threshold = vim.log.levels.INFO,
--        absolute_path = true,
--    },
--
--    ui = {
--        confirm = {
--            remove = true,
--            trash = true,
--            default_yes = false,
--        },
--    },
--
--    modified = {
--        enable = false,
--        show_on_dirs = true,
--        show_on_open_dirs = true,
--    },
--
--    help = {
--        sort_by = "key",
--    },
--
--    log = {
--        enable = false,
--        truncate = false,
--        types = {
--            all = false,
--            config = false,
--            copy_paste = false,
--            dev = false,
--            diagnostics = false,
--            git = false,
--            profile = false,
--            watcher = false,
--        },
--    },
--
--    system_open = {
--        cmd = nil,
--        args = {},
--    },
--})

local api = PROTECTED(require, "nvim-tree.api")

local current_file = vim.fn.bufname()

if vim.fn.getftype(current_file) ~= "dir" then
    api.tree.toggle()
end


