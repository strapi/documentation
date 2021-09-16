<template>
 <CustomBadge text="Silver" type="silver" :withLinkIcon=withLinkIcon :link="link"/>
</template>

<script>
export default {
  name: 'SilverBadge',
  props: {
    text: {
      type: String,
      default: 'Silver',
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
