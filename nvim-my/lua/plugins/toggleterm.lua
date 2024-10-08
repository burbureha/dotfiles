local toggleterm = PROTECTED(require, "toggleterm")

-- on_exit = fun(t: Terminal, job: number, exit_code: number, name: string), -- function to run when terminal process exits
toggleterm.setup({
    open_mapping = [[<C-t>]],
    direction = "float",
    --direction = "vertical",
    --size = vim.api.nvim_win_get_height(0) * 1.5,
    autochdir = true,
    close_on_exit = true, -- close the terminal window when the process exits
    persist_size = false,
    float_opts = {
        -- border = 'shadow',
        height = vim.api.nvim_win_get_height(0) - 2,
        --width = vim.api.nvim_win_get_width(0) / 2 - 1,
    }
})
