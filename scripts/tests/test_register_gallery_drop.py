import importlib.util
from pathlib import Path
import unittest

spec = importlib.util.spec_from_file_location('drop', Path(__file__).parents[1] / 'register_gallery_drop.py')
drop = importlib.util.module_from_spec(spec)
spec.loader.exec_module(drop)

class GalleryDropTest(unittest.TestCase):
    def entry(self, identity=4393):
        return dict(id=identity, title='Editorial', description='A study', promptText='A photo', imageUrl='https://cdn.curify-ai.com/test.jpg', createdAt='2026-10-08', tags=['editorial'])

    def test_preserves_large_legacy_id_and_formatting(self):
        source = '[\n  {"id": 1995459113157841000, "title": "旧图"}\n]\n'
        result, count = drop.register(source, [self.entry()])
        self.assertEqual(count, 1)
        self.assertTrue(result.startswith(source.rstrip()[:-1].rstrip()))
        self.assertEqual(drop.json.loads(result)[0]['id'], 1995459113157841000)

    def test_rerun_is_exact_noop(self):
        first, _ = drop.register('[]\n', [self.entry()])
        self.assertEqual(drop.register(first, [self.entry()]), (first, 0))

    def test_conflicting_id_is_rejected(self):
        first, _ = drop.register('[]\n', [self.entry()])
        changed = self.entry(); changed['promptText'] = 'Different prompt'
        with self.assertRaisesRegex(ValueError, 'ID conflict'):
            drop.register(first, [changed])

    def test_duplicate_image_with_different_id_is_rejected(self):
        first, _ = drop.register('[]\n', [self.entry()])
        with self.assertRaisesRegex(ValueError, 'Image URL already registered'):
            drop.register(first, [self.entry(4394)])

if __name__ == '__main__':
    unittest.main()
