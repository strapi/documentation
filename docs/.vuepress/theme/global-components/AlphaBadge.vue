<template>
 <CustomBadge text="Alpha" type="alpha" :withLinkIcon=withLinkIcon :link="link"/>
</template>

<script>
export default {
  name: 'AlphaBadge',
  props: {
    text: {
      type: String,
      default: 'Alpha',
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
