" BASIC START

" Setting up syntax
syntax enable
" Setting up numbers
set nu relativenumber 
" Required by plugin manager
filetype plugin indent on
" Stop newline continuation of comments WTF?
set formatoptions-=cro
autocmd FileType * setlocal formatoptions-=c formatoptions-=r formatoptions-=o
" Required to keep multiple buffers open multiple buffers
set hidden
" Display long lines as just one line
set nowrap
" Auto indent
set autoindent
" Smart indent
set smartindent
" Horizontal splits will automatically be below
set splitbelow
" Vertical splits will automatically be to the right
set splitright
" Insert 2 spaces for a tab
set tabstop=2
" Change the number of space characters inserted for indentation
set shiftwidth=2
" Makes tabbing smarter will realize you have 2 vs 4
set smarttab
" Converts tabs to spaces
set expandtab
" Always display the status line
set laststatus=0
" Copy paste between vim and everything else
set clipboard=unnamedplus

" BASIC END


" PLUGINS START

" Installing pluging into DIR
call plug#begin('~/.config/nvim/autoload/plugged') 

	" Nerdtree
	Plug 'preservim/nerdtree' 
	" Autocompletion for (, {, [
	Plug 'jiangmiao/auto-pairs' 
  " Colorscheme
  Plug 'joshdick/onedark.vim'

call plug#end()

" PLUGINS END




" PLUGIN CONFIG START
" Colorcheme

"Use 24-bit (true-color) mode in Vim/Neovim when outside tmux.
"If you're using tmux version 2.2 or later, you can remove the outermost $TMUX check and use tmux's 24-bit color support
"(see < http://sunaku.github.io/tmux-24bit-color.html#usage > for more information.)
if (empty($TMUX))
  if (has("nvim"))
    "For Neovim 0.1.3 and 0.1.4 < https://github.com/neovim/neovim/pull/2198 >
    let $NVIM_TUI_ENABLE_TRUE_COLOR=1
  endif
  "For Neovim > 0.1.5 and Vim > patch 7.4.1799 < https://github.com/vim/vim/commit/61be73bb0f965a895bfb064ea3e55476ac175162 >
  "Based on Vim patch 7.4.1770 (`guicolors` option) < https://github.com/vim/vim/commit/8a633e3427b47286869aa4b96f2bfc1fe65b25cd >
  " < https://github.com/neovim/neovim/wiki/Following-HEAD#20160511 >
  if (has("termguicolors"))
    set termguicolors
  endif
endif

if (has("autocmd"))
  augroup colorextend
    autocmd!
    " Make `Function`s bold in GUI mode
    autocmd ColorScheme * call onedark#extend_highlight("Function", { "gui": "bold" })
    " Override the `Statement` foreground color in 256-color mode
    autocmd ColorScheme * call onedark#extend_highlight("Statement", { "fg": { "cterm": 128 } })
    " Override the `Identifier` background color in GUI mode
    autocmd ColorScheme * call onedark#extend_highlight("Identifier", { "bg": { "gui": "#333333" } })
  augroup END
endif

"let g:onedark_termcolors=256
let g:onedark_terminal_italics=1

colorscheme onedark

" PLUGIN CONFIG END
