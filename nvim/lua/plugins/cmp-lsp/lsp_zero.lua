-- local status_ok, lsp_zero = pcall(require, "lsp-zero")

-- if not status_ok then
--     print("lsp-zero didn't load check yours " .. vim.fn.stdpath("config") .. "/lua/plugins/lsp/cmp.lua")
--     return
-- end
local lsp_zero = PROTECTED(require, "lsp-zero")


local lsp = lsp_zero.preset('recommended')
-- local lsp = lsp_zero.preset()


vim.diagnostic.config({
  virtual_text = false,
  -- signs = true,
  -- underline = true,
  -- update_in_insert = false,
  -- severity_sort = false,
})

lsp.set_sign_icons({
  error = '✘',
  warn = '▲',
  hint = '⚑',
  info = '»'
})


lsp.on_attach(function(client, bufnr)
  lsp.default_keymaps({buffer = bufnr})
end)


lsp.setup()
