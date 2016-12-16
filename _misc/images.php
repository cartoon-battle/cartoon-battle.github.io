<?php

    $result = [];

    foreach(['cards.xml', 'cards_finalform.xml'] as $file) {
        $file = new SimpleXMLElement(file_get_contents($file));

        foreach ($file->xpath('//unit') as $unit) {
            if (
                "" === (string)$unit->picture
                || "pendingCard" === (string)$unit->picture
                || "pending" === (string)$unit->picture
                || "pendingArt" === (string)$unit->picture
                || "1" === (string)$unit->hidden
                || "1" === (string)$unit->commander
                || "" === (string)$unit->health // combo card
            ) {
                continue;
            }

            $name = (string)$unit->name;
            $slug = preg_replace('/[^a-z0-9]+/', '-', strtolower(str_replace(["!", ".", "'"], ["", "", ""], $name)));
            $desc = (string)$unit->desc;


            if (in_array($slug, ["man-of-the-house", 'drunk-peggy', 'belcher-date-night',
                                    'drunk-bullock', 'fever-dreams', 'drunk-fry', 'drunk-leela'])) {
                continue;
            }


            $result[(4-(int)$unit->rarity) . '-' . $slug] = [
                'slug' => $slug,
                'name' => $name,
                'desc' => $desc
            ];
        }
    }

    ksort($result);

    echo json_encode(array_values($result), JSON_PRETTY_PRINT);
