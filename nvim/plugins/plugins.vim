" PLUGINS START

" Installing pluging into DIR
call plug#begin('~/.config/nvim/autoload/plugged') 

  " Better syntax support
  Plug 'sheerun/vim-polyglot'

	" Autocompletion for (, {, [
	Plug 'jiangmiao/auto-pairs' 

  " COC
  Plug 'neoclide/coc.nvim', {'branch': 'release'}

  " Close the HTML tags
  Plug 'alvan/vim-closetag'

  " Xresources colorscheme
  Plug 'nekonako/xresources-nvim'

  " Ident blanklines
  Plug 'lukas-reineke/indent-blankline.nvim'

  " Telescope
  Plug 'nvim-lua/plenary.nvim'
  Plug 'nvim-telescope/telescope.nvim'

  Plug 'nvim-telescope/telescope-fzf-native.nvim', { 'do': 'make' }

call plug#end()

" PLUGINS END

