<template>
 <CustomBadge text="Beta" type="beta" :withLinkIcon=withLinkIcon :link="link"/>
</template>

<script>
export default {
  name: 'BetaBadge',
  props: {
    text: {
      type: String,
      default: 'Beta',
      // required: true // to suppress Vue warnings
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
