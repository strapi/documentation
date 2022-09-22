<template>
  <aside class="sidebar">
    <div class="sidebar-box">
      <AlgoliaSearchBox
        :options="algolia"
      />

      <NavLinks />

      <slot name="top" />

      <SidebarLinks
        :depth="0"
        :items="items"
      />
      <slot name="bottom" />
    </div>
  </aside>
</template>

<script>
import AlgoliaSearchBox from '@theme/components/AlgoliaSearchBox'
import SearchBox from '@SearchBox'
import SidebarLinks from '@theme/components/SidebarLinks.vue'
import NavLinks from '@theme/components/NavLinks.vue'
export default {
  name: 'Sidebar',
  components: { SidebarLinks, NavLinks, AlgoliaSearchBox, SearchBox },
  props: ['items'],
  computed: {
    algolia () {
      return this.$themeLocaleConfig.algolia || this.$site.themeConfig.algolia || {}
    }
  }
}
</script>

<style lang="stylus">

.sidebar
  overflow: scroll
  width: 20rem
  background-color: transparent
  border: none

  &::-webkit-scrollbar {
    display: none;
  }

  .sidebar-box
    width: calc(20rem - 1px)
    background: #fff
    border-right: 1px solid #eee

  ul
    padding 0
    margin 0
    list-style-type none
  a
    display inline-block
  .nav-links
    position: absolute
    left: 0
    top: 0
    display none
    border-bottom 1px solid $borderColor
    padding 0.5rem 0 0.75rem 0
    a
      font-weight 600
    .nav-item, .repo-link
      display block
      line-height 1.25rem
      font-size 1.1em
      padding 0.5rem 0 0.5rem 1.5rem
  & > .sidebar-links
    padding 1.5rem 0
    & > li > a.sidebar-link
      font-size 1.1em
      line-height 1.7
      font-weight bold
    & > li:not(:first-child)
      margin-top .75rem
@media (max-width: $MQMobile)
  .sidebar
    .nav-links
      display block
      .dropdown-wrapper .nav-dropdown .dropdown-item a.router-link-active::after
        top calc(1rem - 2px)
    & > .sidebar-links
      padding 1rem 0
</style>
