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

" This is recommended by COC
set nobackup
set nowritebackup

" We don't see things like -- INSERT --
set noshowmode

" Treat dash separeted words ass a one word
set iskeyword+=-

colorscheme xresources

" BASIC END

