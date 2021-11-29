<template>
 <CustomBadge text="Bronze" type="bronze" :withLinkIcon=withLinkIcon :link="link"/>
</template>

<script>
export default {
  name: 'BronzeBadge',
  props: {
    text: {
      type: String,
      default: 'Bronze',
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
