return {
  {
    "nvim-neo-tree/neo-tree.nvim",
    cmd = "Neotree",
    opts = {
      window = {
        mappings = {
          ["c"] = "none", -- takes text input for destination, also accepts the optional config.show_path option like "add":
          ["v"] = "open_vsplit",
          ["C"] = "none",
        },
      },

      filesystem = {
        -- bind_to_cwd = true,
        follow_current_file = {
          enabled = true,
          leave_dirs_open = false,
        },

        filtered_items = {
          hide_dotfiles = false,
        },
        window = {
          mappings = {
            ["c"] = "set_root",

            ["/"] = "none",
          },
        },
        fuzzy_finder_mappings = { -- define keymaps for filter popup window in fuzzy_finder_mode
          ["<down>"] = "move_cursor_down",
          ["<n>"] = "move_cursor_down",
          ["<up>"] = "move_cursor_up",
          ["<N>"] = "move_cursor_up",
          ["<p>"] = "move_cursor_up",
        },
      },

      buffers = {
        window = {
          mappings = {
            ["<bs>"] = "navigate_up",
            ["C"] = "navigate_up",
            ["c"] = "set_root",
          },
        },
      },
    },
    keys = {
      {
        "<C-e>",
        function()
          require("neo-tree.command").execute({ toggle = true, dir = LazyVim.root() })
        end,
        desc = "Explorer NeoTree (Root Dir)",
      },
    },
  },
}
