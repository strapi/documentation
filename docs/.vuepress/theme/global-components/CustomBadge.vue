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
    position relative
    top -.2em
    left .6em
    background-color $danger100
    text-transform uppercase
    font-size .4em
    font-weight 700
    color $neutral800
    border 1px solid #F6ECFC
    border-radius 4px
    padding .3em .6em .25em 1.2em
    &::before
      position absolute
      content: '•'
      font-size 1.5em
      color $danger600
      left .25em
      top .15em
      content: '•'
      font-size 1.5em
      color $danger600
  &.beta
    position relative
    top -.2em
    left .6em
    background-color $alternative100
    text-transform uppercase
    font-size .4em
    font-weight 700
    color $neutral800
    border 1px solid #F6ECFC
    border-radius 4px
    padding .3em .6em .25em 1.2em
    &::before
      position absolute
      left .25em
      top .15em
      content: '•'
      font-size 1.5em
      color $alternative600
</style>

