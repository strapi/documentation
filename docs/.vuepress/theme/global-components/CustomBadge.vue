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
      required: true
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
</style>

