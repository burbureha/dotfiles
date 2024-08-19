local lspconfig = PROTECTED(require, "lspconfig")

-- Configuration for rust-analyzer, without it RA takes too much ram and starts too slow
lspconfig.rust_analyzer.setup({
    -- on_attach = on_attach,
    settings = {
        ["rust-analyzer"] = {
            cachePriming = {
                enable = false
            },
        },
        -- lru = {
        --     capacity = 32
        -- },
        -- checkOnSave = false,

        diagnostics = {
            experimental = {
                enable = true
            }
        },
        cargo = {
            buildScripts = {
                enable = false
            }
        }
    }
})
