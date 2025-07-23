interface PageInfo {
  title?: string,
  description?: string,
  keywords?: string,
}

interface SsrContext {
  page: PageInfo
}

export function setMetaInfo(info: PageInfo, ssrContext?: SsrContext) {
  if (import.meta.env.SSR) {
    if (ssrContext) {
      /* TODO: where is to read?

      ssrContext.page = {
        title: info.title ?? null,
        description: info.description ?? null,
        keywords: info.keywords ?? null,
      };*/
    }
  } else {
    if (info.title !== undefined) {
      document.title = info.title;
    }

    if (info.description !== undefined) {
      const descriptionEl = document.querySelector("head meta[name='description']");
      if (!descriptionEl) {
        createMeta("description", info.description);
      } else {
        descriptionEl.setAttribute("content", info.description);
      }
    }

    if (info.keywords !== undefined) {
      const keywordsEl = document.querySelector("head meta[name='keywords']");
      if (!keywordsEl) {
        createMeta("keywords", info.keywords);
      } else {
        keywordsEl.setAttribute("content", info.keywords);
      }
    }
  }
}

function createMeta(name: string, content: string) {
  var meta = document.createElement("meta");
  meta.name = name;
  meta.content = content;
  document.getElementsByTagName("head")[0].appendChild(meta);
}
