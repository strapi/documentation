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
  &.beta
    position relative
    top -.2em
    left .6em
    text-transform uppercase
    font-size 14px
    font-weight 700
    border-radius 4px
    padding .32em .6em .25em 1.2em
    color $neutral800
    &::before
      position absolute
      content: '•'
      font-size 1.5em
      left .25em
      top .12em
      content: '•'
      font-size 1.5em
  &.alpha
    background-color $danger100
    &::before
      color $danger600
  &.beta
    background-color $alternative100
    &::before
      color $alternative600
</style>

