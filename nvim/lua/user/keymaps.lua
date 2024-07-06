-- <CR> - Carriage return- Enter
local opts = { 
    noremap = true, -- not recursive
    silent = true,  -- no output for map
}

local term_opts = { 
    silent = true
}

-- local keymap = vim.api.nvim_set_keymap -- Shorten function name for setting keymaps
local keymap = vim.keymap.set -- Shorten function name for setting keymaps

--Remap space as leader key
    -- keymap("", "<Space>", "<Nop>", opts)
    -- vim.g.mapleader = " "
    -- vim.g.maplocalleader = " "

-- Modes
--   normal_mode = "n",
--   insert_mode = "i",
--   visual_mode = "v",
--   visual_block_mode = "x",
--   term_mode = "t",
--   command_mode = "c",

-- Normal --

-- Better window navigation
keymap("n", "<C-h>", "<C-w>h", opts)
keymap("n", "<C-j>", "<C-w>j", opts)
keymap("n", "<C-k>", "<C-w>k", opts)
keymap("n", "<C-l>", "<C-w>l", opts)

-- Better tabs navigation
keymap("n", "<S-l>", "gt", opts)
keymap("n", "<S-h>", "gT", opts)
-- keymap("n", "<leader>e", ":Lex 30<cr>", opts)

-- Resize with arrows
keymap('n', '<C-Left>', require('smart-splits').resize_left)
keymap('n', '<C-Down>', require('smart-splits').resize_down)
keymap('n', '<C-Up>', require('smart-splits').resize_up)
keymap('n', '<C-Right>', require('smart-splits').resize_right)

-- Navigate buffers
-- keymap("n", "<S-n>", ":bnext<CR>", opts)
-- keymap("n", "<S-p>", ":bprevious<CR>", opts)


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
-- vim.cmd.command("Waq wqa")

-- Insert --

-- Visual --
-- Stay in indent mode
keymap("v", "<", "<gv", opts)
keymap("v", ">", ">gv", opts)

-- Move text up and down
-- keymap("v", "<A-j>", ":m .+1<CR>==", opts)
keymap("v", "<A-k>", ":m .-2<CR>==", opts)
keymap("v", "p", '"_dP', opts) -- disable yanking in visual mode

-- Visual Block --
-- Move text up and down
-- keymap("x", "J", ":move '>+1<CR>gv-gv", opts)
-- keymap("x", "K", ":move '<-2<CR>gv-gv", opts)
keymap("x", "<A-j>", ":move '>+1<CR>gv-gv", opts)
keymap("x", "<A-k>", ":move '<-2<CR>gv-gv", opts)

-- Terminal --
-- Better terminal navigation
keymap("t", "<C-h>", "<C-\\><C-N><C-w>h", term_opts)
keymap("t", "<C-j>", "<C-\\><C-N><C-w>j", term_opts)
keymap("t", "<C-k>", "<C-\\><C-N><C-w>k", term_opts)
keymap("t", "<C-l>", "<C-\\><C-N><C-w>l", term_opts)


-- Search --
keymap("n", "<CR>", ":noh<CR><CR>", opts)
keymap("n", "<ESC>", ":noh<CR><ESC>", opts)


-- Telescope

local builtin = require('telescope.builtin')


local function telescope_nvim_tree_find_files()
    local nv_tree = PROTECTED(require, 'nvim-tree.api')
    if  nv_tree.tree.is_visible() then
        abs_path = nv_tree.tree.get_nodes().absolute_path
        builtin.find_files({
            cwd = abs_path
        })
    else
        builtin.find_files()
    end
end


local function telescope_nvim_tree_live_grep()
    local nv_tree = PROTECTED(require, 'nvim-tree.api')
    if  nv_tree.tree.is_visible() then
        abs_path = nv_tree.tree.get_nodes().absolute_path
        builtin.live_grep({
            cwd = abs_path
        })
    else
        builtin.live_grep()
    end
end


-- keymap('n', '<C-f>', builtin.find_files, {})
keymap('n', '<C-f>', telescope_nvim_tree_find_files, {})
--keymap('n', '<C-g>', builtin.live_grep, {})
keymap('n', '<C-g>', telescope_nvim_tree_live_grep, {})
keymap('n', '<C-b>', builtin.buffers, {})
keymap('n', '<C-p>', builtin.help_tags, {})


-- Nvim tree
keymap("n","<C-e>" ,":NvimTreeToggle<CR>", term_opts)

function my_on_attach(bufnr)
  local api = require("nvim-tree.api")

  local function opts(desc)
    return { desc = "nvim-tree: " .. desc, buffer = bufnr, noremap = true, silent = true, nowait = true }
  end

  -- default mappings
  api.config.mappings.default_on_attach(bufnr)

  keymap('n', '<C-e>', api.tree.close,                  opts('Close'))
  keymap('n', 'c',     api.tree.change_root_to_node,    opts('CD'))
  keymap('n', '?',     api.tree.toggle_help,            opts('Help'))
  keymap('n', '<C-t>', ":ToggleTerm<CR>",               opts('Toggle terminal'))
end



-- Open help window in a vertical split to the right.
vim.api.nvim_create_autocmd("BufWinEnter", {
    group = vim.api.nvim_create_augroup("help_window_right", {}),
    pattern = { "*.txt" },
    callback = function()
        if vim.o.filetype == 'help' then vim.cmd.wincmd("L") end
    end
})
