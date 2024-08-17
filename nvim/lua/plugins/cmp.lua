if false then
  -- return {
  --   {
  --     "hrsh7th/nvim-cmp",
  --     ---@param opts cmp.ConfigSchema
  --     opts = function(_, opts)
  --       local has_words_before = function()
  --         unpack = unpack or table.unpack
  --         local line, col = unpack(vim.api.nvim_win_get_cursor(0))
  --         return col ~= 0 and vim.api.nvim_buf_get_lines(0, line - 1, line, true)[1]:sub(col, col):match("%s") == nil
  --       end

  --       local cmp = require("cmp")

  --       opts.mapping = vim.tbl_extend("force", opts.mapping, {
  --         ["<CR>"] = cmp.mapping.confirm({ select = true, behavior = cmp.ConfirmBehavior.Replace }),
  --         ["<Tab>"] = cmp.mapping(function(fallback)
  --           if cmp.visible() then
  --             cmp.select_next_item()
  --           -- You could replace the expand_or_jumpable() calls with expand_or_locally_jumpable()
  --           -- they way you will only jump inside the snippet region
  --           -- elseif luasnip.expand_or_jumpable() then
  --           --   luasnip.expand_or_jump()
  --           elseif has_words_before() then
  --             cmp.complete()
  --           else
  --             fallback()
  --           end
  --         end, { "i", "s" }),

  --         ["<S-Tab>"] = cmp.mapping(function(fallback)
  --           if cmp.visible() then
  --             cmp.select_prev_item()
  --           -- elseif luasnip.jumpable(-1) then
  --           --   luasnip.jump(-1)
  --           else
  --             fallback()
  --           end
  --         end, { "i", "s" }),
  --       })

  --       -- opts.mapping = vim.tbl_extend(
  --       --   "force",
  --       --   opts.mapping,
  --       --   cmp.config.sources({
  --       --     { name = "luasnip", priority = 4 }, -- For luasnip users.
  --       --     { name = "nvim_lsp", priority = 3 },
  --       --     { name = "buffer", priority = 2 }, -- ??
  --       --     { name = "path", priority = 1 },
  --       --   })
  --       -- )

  --       -- opts.formatting = vim.tbl_extend("force", opts.formatting, {
  --       --   fields = { "kind", "abbr", "menu" },
  --       --   format = function(entry, vim_item)
  --       --     -- Kind icons
  --       --     vim_item.kind = string.format("%s", kind_icons[vim_item.kind])
  --       --     -- vim_item.kind = string.format('%s %s', kind_icons[vim_item.kind], vim_item.kind) -- This concatonates the icons with the name of the item kind
  --       --     vim_item.menu = ({
  --       --       luasnip = "[Snippet]",
  --       --       nvim_lsp = "[LSP]",
  --       --       buffer = "[Buffer]",
  --       --       path = "[Path]",
  --       --     })[entry.source.name]
  --       --     return vim_item
  --       --   end,
  --       -- })

  --       --`/` cmdline setup.
  --       -- cmp.setup.cmdline("/", {
  --       --   mapping = cmp.mapping.preset.cmdline(),
  --       --   sources = {
  --       --     { name = "buffer" },
  --       --   },
  --       -- })
  --     end,
  --   },
  -- }
end

if true then
  return {
    "hrsh7th/nvim-cmp",

    ---@param opts cmp.ConfigSchema
    opts = function(_, opts)
      local has_words_before = function()
        unpack = unpack or table.unpack
        local line, col = unpack(vim.api.nvim_win_get_cursor(0))
        return col ~= 0 and vim.api.nvim_buf_get_lines(0, line - 1, line, true)[1]:sub(col, col):match("%s") == nil
      end

      local cmp = require("cmp")

      opts.mapping = vim.tbl_extend("force", opts.mapping, {
        ["<Tab>"] = cmp.mapping(function(fallback)
          if cmp.visible() then
            -- You could replace select_next_item() with confirm({ select = true }) to get VS Code autocompletion behavior
            cmp.select_next_item()
          elseif vim.snippet.active({ direction = 1 }) then
            vim.schedule(function()
              vim.snippet.jump(1)
            end)
          elseif has_words_before() then
            cmp.complete()
          else
            fallback()
          end
        end, { "i", "s" }),
        -- ["<Tab>"] = cmp.mapping(function(fallback)
        --   local luasnip = require("lvim.utils.modules").require_on_index("luasnip")
        --   if cmp.visible() then
        --     cmp.select_next_item()
        --   elseif luasnip.expand_or_locally_jumpable() then
        --     luasnip.expand_or_jump()
        --   --elseif jumpable(1) then
        --   --  luasnip.jump(1)
        --   elseif has_words_before() then
        --     -- cmp.complete()
        --     fallback()
        --   --else
        --   --  fallback()
        --   end
        -- end, { "i", "s" }),

        ["<S-Tab>"] = cmp.mapping(function(fallback)
          if cmp.visible() then
            cmp.select_prev_item()
          elseif vim.snippet.active({ direction = -1 }) then
            vim.schedule(function()
              vim.snippet.jump(-1)
            end)
          else
            fallback()
          end
        end, { "i", "s" }),

        ["<C-f>"] = cmp.config.disable,
      })

      opts.window = {
        completion = cmp.config.window.bordered(),
        documentation = cmp.config.window.bordered(),
      }

      --opts.formatting = vim.tbl_extend("force", opts.formatting, {
      --  max_width = 0,
      --  fields = { "kind", "abbr", "menu" },
      --})
      opts.formatting = vim.tbl_extend("force", opts.mapping, {
        format = function(entry, item)
          local icons = LazyVim.config.icons.kinds
          if icons[item.kind] then
            item.kind = icons[item.kind] .. item.kind
          end

          local widths = {
            abbr = vim.g.cmp_widths and vim.g.cmp_widths.abbr or 40,
            menu = vim.g.cmp_widths and vim.g.cmp_widths.menu or 30,
          }

          for key, width in pairs(widths) do
            if item[key] and vim.fn.strdisplaywidth(item[key]) > width then
              item[key] = vim.fn.strcharpart(item[key], 0, width - 1) .. "…"
            end
          end

          item.menu = nil

          return item
        end,
      })

      opts.completion = vim.tbl_extend("force", opts.mapping, {
        ---@usage The minimum length of a word to complete on.
        keyword_length = 1,
      })
    end,
  }
end
