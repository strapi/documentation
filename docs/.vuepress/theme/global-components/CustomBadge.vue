<template>
 <a :href="link" v-if="link"><Badge :type=type :text=text vertical="middle"/><OutboundLink v-if="withLinkIcon"/></a>
 <span v-else>
  <Badge :type=type :text=text vertical="middle"/><OutboundLink v-if="withLinkIcon"/>
 </span>
</template>

<script>
export default {
  name: 'CustomBadge',
  props: {
    text: {
      type: String,
      default: 'Badge',
      // required: true // to suppress Vue warnings
    },
    withLinkIcon: {
      type: Boolean,
    },
    link: {
      type: String,
    },
    type: {
      type: String,
    }
  },
}
</script>

<style lang="stylus" scoped>
>>> .badge
  &.gold
    background-color #f7b73e
  &.silver
    background-color #00b6c8
  &.bronze
    background-color #15bb70
  &.alpha
    background-color transparent
    border solid 2px #f00
    border-radius 4px
    color #f00
    margin-bottom 2px
  &.beta
    background-color transparent
    border solid 2px #4945ff
    border-radius 4px
    color #4945ff
    margin-bottom 2px
</style>

