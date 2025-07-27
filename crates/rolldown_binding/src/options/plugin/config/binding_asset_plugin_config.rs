use std::sync::Arc;

use napi::bindgen_prelude::FnArgs;
use rolldown_plugin_asset::AssetPlugin;
use rolldown_plugin_utils::UsizeOrFunction;

use crate::types::{
  binding_string_or_regex::{BindingStringOrRegex, bindingify_string_or_regex_array},
  js_callback::{JsCallback, JsCallbackExt},
};
use derive_more::Debug;
type BindingUsizeOrFunction = JsCallback<FnArgs<(String, String)>, Option<u32>>;

#[napi_derive::napi(object, object_to_js = false)]
#[derive(Debug)]
pub struct BindingAssetPluginConfig {
  pub is_server: Option<bool>,
  pub url_base: Option<String>,
  pub public_dir: Option<String>,
  pub assets_include: Option<Vec<BindingStringOrRegex>>,
  #[debug(skip)]
  #[napi(ts_type = "number |(file: string, content:String)=> VoidNullable<number>")]
  pub asset_inline_limit: napi::Either<u32, BindingUsizeOrFunction>,
}

impl From<BindingAssetPluginConfig> for AssetPlugin {
  fn from(config: BindingAssetPluginConfig) -> Self {
    let assert_inline_limit = match config.asset_inline_limit {
      napi::Either::A(limit) => UsizeOrFunction::Number(limit as usize),
      napi::Either::B(func) => {
        UsizeOrFunction::Function(Arc::new(move |file: &str, content: &[u8]| {
          let file = file.to_string();
          let content = String::from_utf8_lossy(content).to_string();
          Box::pin({
            let value = func.clone();
            async move {
              match value.invoke_async((file, content).into()).await {
                Ok(Some(value)) => Ok(Some(value as usize)),
                Ok(None) => Ok(None),
                Err(e) => Err(anyhow::Error::from(e)),
              }
            }
          })
        }))
      }
    };
    Self {
      url_base: config.url_base.unwrap_or_default(),
      is_server: config.is_server.unwrap_or_default(),
      public_dir: config.public_dir.unwrap_or_default(),
      assets_include: config
        .assets_include
        .map(bindingify_string_or_regex_array)
        .unwrap_or_default(),
      asset_inline_limit: assert_inline_limit,
    }
  }
}
