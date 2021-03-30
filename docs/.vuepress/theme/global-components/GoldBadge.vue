<template>
 <CustomBadge text="Gold" type="gold" :withLinkIcon=withLinkIcon :link="link"/>
</template>

<script>
export default {
  name: 'GoldBadge',
  props: {
    text: {
      type: String,
      default: 'Gold',
      required: true
    },
    withLinkIcon: {
      type: Boolean,
      default: false
    },
    link: {
      type: String,
    },
  }
}
</script>
