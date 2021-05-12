<template>
	<router-link :to="link" class="install-link install-link--alt">
    <span class="install-link__container">
      <span class="icon">
        <slot name="icon" />
      </span>
      <span>
        <p class="title"><slot name="title" /></p>
			<!-- <p class="description"><slot name="description" /></p> -->
      </span>
    </span>

	</router-link>
</template>

<script>
	export default {
		name: 'InstallLinkAlt',
		props: {
			link: {
				type: String,
				required: true
			}
		}
	}
</script>

<style lang="scss" scoped>
.install-link {
	background-color: rgba(63,74,86, .6);
	display: flex;
  flex-direction: column;
	align-items: center;
  justify-content: center;
	color: white;
	padding: 16px;
	border-radius: 50%;
  width: 100px;
  height: 100px;
	margin: 16px 0; // You'd normally do layout margins etc from the parent, but seeing the parent
					// is a markdown file, that's a bit annoying
  text-decoration: none;
  transition: background-color ease-out .4s;

  &__container {
    display: flex;
    flex-direction: column;
  }

	.icon {
		flex-shrink: 0;
		width: 40px;
    margin-left: auto;
    margin-right: auto;
		& ::v-deep svg {
      width: 100%;
			height: auto;
		}
	}
	.title {
		// font-weight: 700;
		margin: 0;
    text-align: center;

	}
	.description {
		font-size: 12px;
		margin: 0;
	}

  &:hover {
    background-color: rgb(129,107,250);
  }
}
</style>

<!-- Copyrigth Directus - https://github.com/directus/docs/blob/master/.vuepress/theme/global-components/InstallLink.vue -->
