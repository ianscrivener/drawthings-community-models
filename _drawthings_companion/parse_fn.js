const esc = function(str) {
    if (typeof str === 'string') {
        return str.replace(/'/g, "''");
    }
    return str;
};


const parse_json = function(category, json_data) {
    const new_data              = {};

    // remove 's' from category to get model_type
    new_data.model_type         = category.slice(0, -1);

    new_data.model_name     = esc(json_data.name);
    new_data.model_family   = esc(json_data.version);
    new_data.ckpt_file      = esc(json_data.file);
    new_data.text_encoder   = esc(json_data.text_encoder) || "";
    new_data.clip_encoder   = esc(json_data.clip_encoder) || "";
    new_data.image_encoder  = esc(json_data.image_encoder) || "";
    new_data.autoencoder    = esc(json_data.autoencoder) || "";
    new_data.t5_encoder     = esc(json_data.t5_encoder) || "";
    new_data.url            = "";

    if(category === 'loras' || category === 'controlnets') {
        if(typeof json_data.download !== "undefined" && typeof json_data.download.file !== "undefined"){
            new_data.url        = esc(json_data.download.file || "");
        };       
    }    

    // console.log(new_data.model_type  , new_data.url);

    new_data.full_json          = esc(JSON.stringify(json_data));

    return new_data;
}


// export the function
export { parse_json };

