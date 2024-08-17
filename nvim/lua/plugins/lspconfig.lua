return {
  {
    "neovim/nvim-lspconfig",
    opts = {

      setup = {
        ["*"] = function(server, opts)
          opts.handlers = opts.handlers or {}
          opts.handlers["textDocument/hover"] = vim.lsp.with(vim.lsp.handlers.hover, { border = "rounded" })
          opts.handlers["textDocument/signatureHelp"] =
            vim.lsp.with(vim.lsp.handlers.signature_help, { border = "rounded" })
        end,
      },

      diagnostics = {
        virtual_text = false,
      },

      inlay_hints = {
        enabled = false,
      },

      servers = {
        lua_ls = {
          settings = {
            Lua = {
              diagnostics = {
                globals = { "vim", "LazyVim" },
              },
            },
          },
        },
      },
    },
  },
}
