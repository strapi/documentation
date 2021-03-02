<template>
 <a :href="link" v-if="link"><Badge :type=thisType :text=text vertical="middle"/><OutboundLink  v-if="withLinkIcon"/></a>
 <span v-else>
  <Badge :type=thisType :text=text vertical="middle"/><OutboundLink  v-if="withLinkIcon"/>
 </span>
</template>

<script>
export default {
  name: 'CustomBadge',
  props: {
    text: {
      type: String,
      default: "Badge",
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
  computed: {
    thisType() {
      /** Eventually we could extend this to override badge background color.
       * Currently the built-in VuePress badge only accepts three types,
       * each of them being associated with a color:
       *   - type: tip     => green badge
       *   - type: warning => yellow badge
       *   - type: error   => red badge
       */

      if (this.type === 'gold') {
        return "warning"
      }
      return this.type
    }
  },
}
</script>
