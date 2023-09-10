local fn = vim.fn

-- Automatically install packer
local install_path = fn.stdpath "data" .. "/site/pack/packer/start/packer.nvim"
if fn.empty(fn.glob(install_path)) > 0 then
  PACKER_BOOTSTRAP = fn.system {
    "git",
    "clone",
    "--depth",
    "1",
    "https://github.com/wbthomason/packer.nvim",
    install_path,
  }
  print "Installing packer close and reopen Neovim..."
  vim.cmd [[packadd packer.nvim]]
end

-- Autocommand that reloads neovim whenever you save the plugins.lua file
vim.cmd [[
  augroup packer_user_config
    autocmd!
    autocmd BufWritePost plugins.lua source <afile> | PackerSync
  augroup end
]]

-- Use a protected call so we don't error out on first use
local status_ok, packer = pcall(require, "packer")
if not status_ok then
  print("packer didn't load in protected call, check ~/.config/nvim/lua/user/plugins.lua")
  return
end

-- Have packer use a popup window
packer.init {
  display = {
    open_fn = function()
      return require("packer.util").float { border = "rounded" }
    end,
  },
}


-- Install your plugins here
return packer.startup(function(use)
    -- My plugins here
    use "wbthomason/packer.nvim"        -- Have packer manage itself
    use "nvim-lua/popup.nvim"           -- An implementation of the Popup API from vim in Neovim
    use "nvim-lua/plenary.nvim"         -- Useful lua functions used in lots of plugins
    use ("nvim-treesitter/nvim-treesitter",
    {run = ':TSUpdate'})                -- Treesitter, syntax parser
    use "nvim-treesitter/playground"    -- Useful for writing plugins TSPlaygroundToggle
    use {
        'nvim-telescope/telescope.nvim', tag = '0.1.2',
        requires = { {'nvim-lua/plenary.nvim'} }
    }                                   -- Telescope
    use { 'nvim-telescope/telescope-fzf-native.nvim', -- fuzzy finder for telescope 
    run = 'cmake -S. -Bbuild -DCMAKE_BUILD_TYPE=Release && cmake --build build --config Release && cmake --install build --prefix build' }
    use 'lukas-reineke/indent-blankline.nvim' -- Dots instead of blanklines
    use {
        "windwp/nvim-autopairs",
        config = function() require("nvim-autopairs").setup {} end
    }                                   -- Autopairs
    use "lewis6991/gitsigns.nvim"       -- Gitsigns

    use "kyazdani42/nvim-web-devicons"  -- Icons for nvim-tree
    use "kyazdani42/nvim-tree.lua"      -- nvim-tree

    use {
        'VonHeikemen/lsp-zero.nvim',
        branch = 'v2.x',
        requires = {
            -- LSP Support
            {'neovim/nvim-lspconfig'},             -- Required
            {                                      -- Optional
            'williamboman/mason.nvim',
            run = function()
                pcall(vim.cmd, 'MasonUpdate')
            end,
        },
        {'williamboman/mason-lspconfig.nvim'}, -- Optional

        -- Autocompletion
        {'hrsh7th/nvim-cmp'},     -- Required
        {'hrsh7th/cmp-nvim-lsp'}, -- Required
        {'L3MON4D3/LuaSnip',      -- Required
        -- follow latest release.
        tag = "v2.*", -- Replace <CurrentMajor> by the latest released major (first number of latest release)
        -- install jsregexp (optional!:).
        run = "make install_jsregexp"
        },
        }
    }
    use "hrsh7th/cmp-buffer"
    use "hrsh7th/cmp-path"
    use "hrsh7th/cmp-cmdline"
    use "rafamadriz/friendly-snippets"

    use {
        'nvim-lualine/lualine.nvim',
        requires = { 'nvim-tree/nvim-web-devicons', opt = true }
    }                                       -- Lualine
    use "HiPhish/rainbow-delimiters.nvim"   -- Rainbow pairs
    use "akinsho/toggleterm.nvim"           -- Toggle term

    use('mrjones2014/smart-splits.nvim')    -- Smart splits
    use { 'saadparwaiz1/cmp_luasnip' }


    -- Colorschemes
    -- use "LunarVim/Colorschemes"         -- collection of different colorschemes
    use "LunarVim/lunar.nvim"           -- lunar
    use "folke/tokyonight.nvim"         -- tokyonight
    use "tiagovla/tokyodark.nvim"       -- tokyodark
    use "nekonako/xresources-nvim"      -- xresources
    use "pineapplegiant/spaceduck"      -- spaceduck
    use "raphamorim/vim-rio"            -- rio
    use "bluz71/vim-nightfly-colors"    -- nightfly
    use "srcery-colors/srcery-vim"      -- srcere
    use "NTBBloodbath/doom-one.nvim"    -- doom
    use "rose-pine/neovim"              -- rose-pine
    use "bluz71/vim-moonfly-colors"     -- moonfly
    use "shaunsingh/moonlight.nvim"     -- moonlight
    use "nxvu699134/vn-night.nvim"      -- vn-night
    use "sekke276/dark_flat.nvim"       -- dark_flat
    use "Shatur/neovim-ayu"             -- ayu


    -- Some other useful plugins that I didn't want to install
    -- "nfrid/treesitter-utils"
    -- "anuvyklack/animation.nvim"
    -- use "rktjmp/lush.nvim"              -- Lush for custom colorschemes (:LushRunTutorial)
    -- use 'folke/neodev.nvim'                 -- NOTE DOESN'T WORK
    -- use 'simrat39/symbols-outline.nvim'  --
    -- use "stevearc/aerial.nvim"           -- It's used for symbols, but it's not ready yet, looks bad
    -- use 'junegunn/vim-easy-align'


    -- Automatically set up your configuration after cloning packer.nvim
    -- Put this at the end after all plugins
    if PACKER_BOOTSTRAP then
        require("packer").sync()
    end
end)
