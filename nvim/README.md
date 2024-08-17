# 💤 LazyVim

A starter template for [LazyVim](https://github.com/LazyVim/LazyVim).
Refer to the [documentation](https://lazyvim.github.io/installation) to get started.


# NeoTree
[X] NeoTree has to be changed, because hitting "/" doesn't search anything like I want
[X] NeoTree should display hidden files by default, right now I have to press "H"
[X] `v` should open window in vertical mode, right now it's `s`
[X] When hitting enter on directory, should open said directory
[X] When pressing "c" should `cd` into that directory, in other words make it root, right now it's "."

# Autocompletion and lsp
[X] SuperTab when completing
[X] in clangd files `auto` keyword, and in functions there is shadows text, should turn it off (Virtual text), vim.diagnostics.config.virtual_text is set to false already, there is still virtual text.
[X] `gl` should tell me diagnostics
[X] Install clangd
[X] When pressing `o` and jump to next line, there is no indentation
[X] configure Treesitter
[] clangd doesn't start to index if you open .h file ???


# Telescope
[X] When pressing "ESC" should close everything
[X] "CTRL + f" should open files finder [https://github.com/LazyVim/LazyVim/issues/1485], it's in cmp, and in noice, look at [http://www.lazyvim.org/plugins/coding]
[X] "CTRL + g" should open grep

# Basic vim use
[X] "s" doesn't changes text under the cursor
[X] `ZZ` and `ZQ` should close all windows
[] "," does something strange to text, possibly copies it.
[] When deleting text, it copies to to yank buffer, fix it

# Buffers and windows
[X] Resizing windows left and right should be switched
[X] make navigation between tabs intuitive
[X] help windows should open vertically
[] `CTRL + Shift` should move tabs
[] `:q` should close buffer and switch to previous one

# Plugins
[X] stop which.nvim plugin
[] Install colorful brackes
[] I want to see dots instead of empty space where there is spaces
[] Install colorschemes

# Not sure that want to change
[] When writing something shadow text appears, should decide whether I like it or not, definitely I should be able  to switch
[] When completing I'm already on first completion, I want to press `TAB` to start completing, in other word hitting `TAB` once should get me to first completion item
