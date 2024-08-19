-- Keymaps are automatically loaded on the VeryLazy event
-- Default keymaps that are always set: https://github.com/LazyVim/LazyVim/blob/main/lua/lazyvim/config/keymaps.lua
-- Add any additional keymaps here
--

local keymap = vim.keymap.set -- Shorten function name for setting keymaps
local delete_keymap = vim.keymap.del

local opts = {
  noremap = true, -- not recursive
  silent = true, -- no output for map
}

local term_opts = {
  silent = true,
}

-- When writing and closing vim with ZZ, write to all open buffers
local function save_and_exit()
  -- wirte all buffers first
  vim.api.nvim_command(":wa")
  -- quit all buffers
  vim.api.nvim_command(":qa")
end

keymap("n", "ZZ", save_and_exit, opts)
--keymap("n", "ZZ", ":wqa<CR>", opts)
keymap("n", "ZQ", ":qa!<CR>", opts)

local function close_buffer_and_move_to_the_left_one()
  local current_buf = vim.api.nvim_get_current_buf()
  local buffers = vim.api.nvim_list_bufs()

  -- Filter out non-loaded and special buffers
  local valid_buffers = {}
  for _, buf in ipairs(buffers) do
    if vim.api.nvim_buf_is_valid(buf) and vim.bo[buf].buflisted and vim.api.nvim_buf_get_option(buf, "modifiable") then
      table.insert(valid_buffers, buf)
    end
  end

  -- Find the index of the current buffer
  local current_index
  for i, buf in ipairs(valid_buffers) do
    if buf == current_buf then
      current_index = i
      break
    end
  end

  if #valid_buffers > 1 and current_index then
    local target_index = current_index > 1 and current_index - 1 or #valid_buffers
    local target_buf = valid_buffers[target_index]

    -- Switch to the target buffer
    vim.api.nvim_set_current_buf(target_buf)

    -- Delete the original buffer
    vim.api.nvim_buf_delete(current_buf, { force = true })
  else
    vim.cmd.bd()
  end
end
-- Close current buffer and move to the buffer to the left
--keymap("n", "<C-c>", function()
--  if vim.fn.bufnr("#") ~= -1 then
--    local current_buf = vim.api.nvim_get_current_buf()
--    vim.cmd.bprevious()
--    vim.api.nvim_buf_delete(current_buf, { force = true })
--  else
--    vim.cmd.bd()
--  end
--end, opts)
keymap("n", "<C-c>", close_buffer_and_move_to_the_left_one, opts)

-- Terminal --
local lazyterm = function()
  LazyVim.terminal(nil, { cwd = LazyVim.root() })
end
-- Better terminal navigation
keymap("t", "<C-h>", "<C-\\><C-N><C-w>h", term_opts)
keymap("t", "<C-j>", "<C-\\><C-N><C-w>j", term_opts)
keymap("t", "<C-k>", "<C-\\><C-N><C-w>k", term_opts)
keymap("t", "<C-l>", "<C-\\><C-N><C-w>l", term_opts)
keymap("t", "<C-t>", "<cmd>close<CR>", term_opts)
delete_keymap("n", "<C-/>")
keymap("n", "<C-t>", lazyterm, opts)
-- If terminal is open should close in normal mode, make autocommand
keymap("i", "<C-t>", lazyterm, opts)
-- Diagnostics
delete_keymap("n", "<leader>cd")
keymap("n", "gl", vim.diagnostic.open_float, opts)

-- Save file without formatting
keymap("n", "<C-w>", ":noautocmd w<CR>", opts)

--
-- delete_keymap("n", "<C-f>")
-- keymap("n", "<C-f>", "<Nop>", opts)
--keymap("n", "<C-f>", "<cmd>Telescope live_grep<CR>", opts)
--
