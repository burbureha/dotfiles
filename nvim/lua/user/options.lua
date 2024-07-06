-- OPTIONS START

vim.opt.syntax = "enable"                                                                       -- Setting up syntax
vim.opt.nu = true                                                                               -- Setting up numbers
vim.opt.relativenumber = true                                                                   -- Setting up numbers
vim.cmd "filetype plugin indent on"                                                             -- Required by plugin manager NOTE: Might be depricated
vim.cmd "set formatoptions-=cro"                                                                -- Stop newline continuation of comments
vim.cmd "autocmd FileType * setlocal formatoptions-=c formatoptions-=r formatoptions-=o"        -- Stop newline continuation of comments
-- vim.opt.hidden = true                                                                           -- Required to keep multiple buffers open multiple buffers
vim.opt.hidden = true                                                                          -- Required to keep multiple buffers open multiple buffers (false for toggleterm, it allows closing it, in documentation it says it should be on though)
vim.opt.wrap = false                                                                            -- Display long lines as just one line
vim.opt.autoindent = true                                                                       -- Auto indent
vim.opt.smartindent = true                                                                      -- Smart indent
vim.opt.splitbelow = true                                                                       -- Horizontal splits will automatically be below
vim.opt.splitright = true                                                                       -- Vertical splits will automatically be to the right
vim.opt.tabstop = 4                                                                             -- Insert 2 spaces for a tab
vim.opt.shiftwidth = 4                                                                          -- Change the number of space characters inserted for indentation
vim.opt.smarttab = true                                                                         -- Makes tabbing smarter will realize you have 2 vs 4
vim.opt.expandtab = true                                                                        -- Converts tabs to spaces
vim.opt.laststatus = 0                                                                          -- Always display the status line
vim.opt.clipboard = "unnamedplus"                                                               -- Copy paste between vim and everything else
vim.opt.backup = false                                                                          -- This is recommended by COC
vim.opt.writebackup = false
vim.opt.showmode = true                                                                         -- We see things like -- INSERT --
vim.cmd "set iskeyword+=-"                                                                      -- Treat dash separeted words ass a one word
-- vim.opt.cursorline = true                                                                       -- It needed for CursorLineNr highglight
vim.cmd "highlight CursorLine cterm=NONE ctermbg=NONE ctermfg=NONE guibg=NONE guifg=NONE"       -- It needed for CursorLineNr highglight
vim.opt.hlsearch = true                                                                         -- Stop highlight after search
vim.opt.termguicolors = true                                                                    -- Setting gui colors for termnal
vim.opt.autochdir = true
vim.g.noswapfile = true                                                                          -- No swap files

-- OPTIONS END
