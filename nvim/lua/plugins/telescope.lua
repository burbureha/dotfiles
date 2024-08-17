return {
  { "nvim-telescope/telescope-fzf-native.nvim", build = "make" },

  -- change some telescope options and a keymap to browse plugin files
  {
    "nvim-telescope/telescope.nvim",
    keys = {
      -- add a keymap to browse plugin files
      -- stylua: ignore
      -- TODO add support for current working directories via Neotree
      {
        --"<C-f>", function() require("telescope.builtin").find_files({ cwd = LazyVim.root() }) end,
        "<C-f>",
        require("telescope.builtin").find_files,
      },
      {
        --"<C-g>",
        --function()
        --  require("telescope.builtin").live_grep({ cwd = LazyVim.root.cwd() })
        --end,
        "<C-g>",
        require("telescope.builtin").live_grep,
      },
    },

    opts = function()
      local telescope = require("telescope")
      local actions = require("telescope.actions")

      local open_with_trouble = function(...)
        return require("trouble.sources.telescope").open(...)
      end
      local find_files_no_ignore = function()
        local action_state = require("telescope.actions.state")
        local line = action_state.get_current_line()
        LazyVim.pick("find_files", { no_ignore = true, default_text = line })()
      end
      local find_files_with_hidden = function()
        local action_state = require("telescope.actions.state")
        local line = action_state.get_current_line()
        LazyVim.pick("find_files", { hidden = true, default_text = line })()
      end

      return {
        pickers = {
          colorscheme = {
            enable_preview = true,
          },
        },
        defaults = {
          prompt_prefix = " ",
          selection_caret = " ",
          -- open files in the first window that is an actual file.
          -- use the current window if no other window is available.

          get_selection_window = function()
            local wins = vim.api.nvim_list_wins()
            table.insert(wins, 1, vim.api.nvim_get_current_win())
            for _, win in ipairs(wins) do
              local buf = vim.api.nvim_win_get_buf(win)
              if vim.bo[buf].buftype == "" then
                return win
              end
            end
            return 0
          end,

          mappings = {
            i = {
              ["<esc>"] = actions.close,
              ["<S-Tab>"] = actions.toggle_selection + actions.move_selection_worse,
              ["<Tab>"] = actions.toggle_selection + actions.move_selection_better,
              ["<c-t>"] = open_with_trouble,
              ["<a-t>"] = open_with_trouble,
              ["<a-i>"] = find_files_no_ignore,
              ["<a-h>"] = find_files_with_hidden,
              ["<C-Down>"] = actions.cycle_history_next,
              ["<C-Up>"] = actions.cycle_history_prev,
              ["<C-f>"] = actions.preview_scrolling_down,
              ["<C-b>"] = actions.preview_scrolling_up,
            },
            n = {
              ["q"] = actions.close,
              ["<S-Tab>"] = actions.toggle_selection + actions.move_selection_worse,
              ["<Tab>"] = actions.toggle_selection + actions.move_selection_better,
            },
          },

          extensions = {
            fzf = {
              fuzzy = true, -- false will only do exact matching
              override_generic_sorter = true, -- override the generic sorter
              override_file_sorter = true, -- override the file sorter
              case_mode = "smart_case", -- or "ignore_case" or "respect_case"
            },
          },

          telescope.load_extension("fzf"),
        },
      }
    end,
  },
}
