local opts = { noremap = true, silent = true }
local keymap = vim.api.nvim_set_keymap

-- Normal Mode

--      Window novigation
keymap("n", "<C-h>", "<C-w>h", opts)
keymap("n", "<C-j>", "<C-w>j", opts)
keymap("n", "<C-k>", "<C-w>k", opts)
keymap("n", "<C-l>", "<C-w>l", opts)

--      Telescope
keymap("n", "<C-f>", ":Telescope find_files<cr>", opts)
keymap("n", "<C-g>", ":Telescope live_grep<cr>", opts)
keymap("n", "<C-b>", ":Telescope file_browser<cr>", opts)


-- Visual Mode

--      Move block of text to left and right
keymap("v", "<", "<gv", opts)
keymap("v", ">", ">gv", opts)

--      Move block of text up or down
keymap("v", "<A-j>", ":m .+1<CR>==", opts)
keymap("v", "<A-k>", ":m .-2<CR>==", opts)



