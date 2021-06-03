<template>
	<router-link :to="link" class="install-link install-link--alt">
    <span class="install-link__container">
      <span class="icon__wrapper">
        <slot name="icon" />
      </span>
      <span class="title__wrapper">
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
  background-color: #f8f8f8;
	display: flex;
  flex-direction: column;
	align-items: center;
  justify-content: center;
	color: #2c3e50;
	padding: 16px;
	border-radius: 50%;
  width: 40px;
  height: 40px;
	margin: 16px 0; // You'd normally do layout margins etc from the parent, but seeing the parent
					// is a markdown file, that's a bit annoying
  text-decoration: none !important;
  transition: border-color ease-out .2s;

  &:after {
    content:'';
    position: absolute;
    width: 72px;
    height: 72px;
    border-radius: 50%;
    border: solid 1px #bbbbba;
  }

  &__container {
    display: flex;
    flex-direction: column;
    height: 40px;
  }

	.icon__wrapper {
		flex-shrink: 0;
		width: 40px;
    height: 40px;
    margin-left: auto;
    margin-right: auto;
    transition: all ease-out .2s;

		& ::v-deep svg {
      width: 100%;
			height: auto;
		}
	}

	.title {
		margin-top: 12px;
    text-align: center;

    &__wrapper {
      opacity: 0;
      transition: opacity ease-out .2s;
    }
	}

	.description {
		font-size: 12px;
		margin: 0;
	}

  &:hover {
    &:after {
      border-color: #007EFF;
      border-width: 2px;
    }

    .title__wrapper {
      opacity: 1;
    }

    .title {
      text-decoration: none;
    }

    .icon__wrapper {
      width: 40px;
      height: 44px;
    }
  }
}
</style>
